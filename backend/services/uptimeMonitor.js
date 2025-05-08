const axios = require("axios");
const dns = require("dns").promises;
const https = require("https");
const UptimeMonitor = require("../models/UptimeMonitor");
const UptimeCheck = require("../models/UptimeCheck");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

class UptimeMonitorService {
  constructor() {
    this.monitors = new Map();
    this.locations = ["us-east", "us-west", "eu-central", "ap-south"];
  }

  async initialize() {
    try {
      // Load all active monitors from database
      const monitors = await UptimeMonitor.find({ status: "active" });
      monitors.forEach((monitor) => this.startMonitoring(monitor));
      logger.info(`Initialized ${monitors.length} uptime monitors`);
    } catch (error) {
      logger.error("Failed to initialize uptime monitors", {
        error: error.message,
      });
    }
  }

  async startMonitoring(monitor) {
    if (this.monitors.has(monitor._id.toString())) {
      return;
    }

    const interval = setInterval(async () => {
      await this.performCheck(monitor);
    }, monitor.interval * 1000);

    this.monitors.set(monitor._id.toString(), interval);
    logger.info(`Started monitoring: ${monitor.url}`);
  }

  async stopMonitoring(monitorId) {
    const interval = this.monitors.get(monitorId.toString());
    if (interval) {
      clearInterval(interval);
      this.monitors.delete(monitorId.toString());
      logger.info(`Stopped monitoring: ${monitorId}`);
    }
  }

  async performCheck(monitor) {
    const checks = await Promise.all(
      monitor.locations.map((location) =>
        this.checkFromLocation(monitor, location)
      )
    );

    const overallStatus = this.calculateOverallStatus(checks);
    await this.updateMonitorStats(monitor, checks);
    await this.handleAlerts(monitor, checks, overallStatus);
  }

  async checkFromLocation(monitor, location) {
    try {
      const startTime = Date.now();
      const response = await axios.get(monitor.url, {
        timeout: 30000,
        validateStatus: null,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Allow self-signed certificates
        }),
      });

      const responseTime = Date.now() - startTime;
      const sslData = await this.checkSSL(monitor.url);
      const dnsData = await this.checkDNS(monitor.url);

      const check = new UptimeCheck({
        monitor: monitor._id,
        location,
        status: {
          code: response.status,
          text: response.statusText,
        },
        responseTime,
        isUp: response.status >= 200 && response.status < 400,
        headers: response.headers,
        certificate: sslData,
        dns: dnsData,
      });

      await check.save();
      return check;
    } catch (error) {
      const check = new UptimeCheck({
        monitor: monitor._id,
        location,
        isUp: false,
        error: error.message,
      });

      await check.save();
      return check;
    }
  }

  async checkSSL(url) {
    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      const cert = response.request.res.socket.getPeerCertificate();
      return {
        valid: true,
        expiryDate: new Date(cert.valid_to),
        issuer: cert.issuer.CN,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  async checkDNS(url) {
    try {
      const hostname = new URL(url).hostname;
      const [aRecords, cnameRecords, mxRecords] = await Promise.all([
        dns.resolve4(hostname).catch(() => []),
        dns.resolveCname(hostname).catch(() => []),
        dns.resolveMx(hostname).catch(() => []),
      ]);

      return {
        resolved: true,
        records: {
          a: aRecords,
          cname: cnameRecords,
          mx: mxRecords,
        },
      };
    } catch (error) {
      return {
        resolved: false,
        error: error.message,
      };
    }
  }

  calculateOverallStatus(checks) {
    const totalChecks = checks.length;
    const successfulChecks = checks.filter((check) => check.isUp).length;
    return {
      isUp: successfulChecks > 0,
      uptime: (successfulChecks / totalChecks) * 100,
      averageResponseTime:
        checks.reduce((acc, check) => acc + (check.responseTime || 0), 0) /
        totalChecks,
    };
  }

  async updateMonitorStats(monitor, checks) {
    const status = this.calculateOverallStatus(checks);

    if (!status.isUp && !monitor.stats.lastDowntime) {
      monitor.stats.lastDowntime = new Date();
    }

    monitor.stats.uptime = status.uptime;
    monitor.stats.averageResponseTime = status.averageResponseTime;
    await monitor.save();
  }

  async handleAlerts(monitor, checks, status) {
    const shouldAlert = this.shouldSendAlert(monitor, status);
    if (shouldAlert) {
      await this.sendAlerts(monitor, checks, status);
    }
  }

  shouldSendAlert(monitor, status) {
    return (
      !status.isUp ||
      status.averageResponseTime > monitor.alertThreshold.responseTime
    );
  }

  async sendAlerts(monitor, checks, status) {
    if (monitor.notifications.email.enabled) {
      await this.sendEmailAlert(monitor, checks, status);
    }
    if (monitor.notifications.webhook.enabled) {
      await this.sendWebhookAlert(monitor, checks, status);
    }
    if (monitor.notifications.push?.enabled) {
      await notificationService.sendUptimeNotification(monitor, status);
      if (monitor.sslCheck?.enabled) {
        const sslData = checks[0]?.certificate;
        if (sslData) {
          await notificationService.sendSSLExpiryNotification(monitor, sslData);
        }
      }
    }
  }

  async sendEmailAlert(monitor, checks, status) {
    // Implement email notification logic
    logger.info(
      `Email alert for ${monitor.url}: ${status.isUp ? "High latency" : "Down"}`
    );
  }

  async sendWebhookAlert(monitor, checks, status) {
    try {
      await axios.post(monitor.notifications.webhook.url, {
        monitor: monitor.url,
        status,
        checks,
      });
    } catch (error) {
      logger.error("Webhook alert failed", { error: error.message });
    }
  }
}

module.exports = new UptimeMonitorService();
