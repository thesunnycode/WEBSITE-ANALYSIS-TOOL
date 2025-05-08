/**
 * @swagger
 * components:
 *   schemas:
 *     UptimeMonitor:
 *       type: object
 *       required:
 *         - url
 *         - name
 *       properties:
 *         url:
 *           type: string
 *           description: The URL to monitor
 *         name:
 *           type: string
 *           description: Name of the monitor
 *         status:
 *           type: string
 *           enum: [active, paused, error]
 *           description: Current status of the monitor
 *         interval:
 *           type: number
 *           description: Check interval in seconds (60-3600)
 *         locations:
 *           type: array
 *           items:
 *             type: string
 *             enum: [us-east, us-west, eu-central, ap-south]
 *           description: Monitoring locations
 *         notifications:
 *           type: object
 *           properties:
 *             email:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 recipients:
 *                   type: array
 *                   items:
 *                     type: string
 *             webhook:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 url:
 *                   type: string
 * 
 * /uptime:
 *   post:
 *     summary: Create a new uptime monitor
 *     tags: [Uptime]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UptimeMonitor'
 *           example:
 *             url: "https://example.com"
 *             name: "Example Website Monitor"
 *             interval: 300
 *             locations: ["us-east", "eu-central"]
 *             notifications:
 *               email:
 *                 enabled: true
 *                 recipients: ["alerts@example.com"]
 *     responses:
 *       201:
 *         description: Monitor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UptimeMonitor'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get all uptime monitors
 *     tags: [Uptime]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all monitors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UptimeMonitor'
 * 
 * /uptime/{id}:
 *   get:
 *     summary: Get a specific uptime monitor
 *     tags: [Uptime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monitor details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UptimeMonitor'
 *       404:
 *         description: Monitor not found
 * 
 *   put:
 *     summary: Update an uptime monitor
 *     tags: [Uptime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UptimeMonitor'
 *     responses:
 *       200:
 *         description: Monitor updated successfully
 *       404:
 *         description: Monitor not found
 * 
 *   delete:
 *     summary: Delete an uptime monitor
 *     tags: [Uptime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monitor deleted successfully
 *       404:
 *         description: Monitor not found
 * 
 * /uptime/{id}/stats:
 *   get:
 *     summary: Get monitor statistics
 *     tags: [Uptime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monitor statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     monitor:
 *                       $ref: '#/components/schemas/UptimeMonitor'
 *                     checks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: object
 *                             properties:
 *                               code:
 *                                 type: number
 *                               text:
 *                                 type: string
 *                           responseTime:
 *                             type: number
 *                           isUp:
 *                             type: boolean
 *                     stats:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                           description: Uptime percentage
 *                         averageResponseTime:
 *                           type: number
 *                           description: Average response time in milliseconds
 *                         lastDowntime:
 *                           type: string
 *                           format: date-time
 *                           description: Last recorded downtime
 *       404:
 *         description: Monitor not found
 */ 