/**
 * @swagger
 * /seo/{websiteAnalysisId}/analyze:
 *   post:
 *     summary: Analyze website SEO
 *     tags: [SEO]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: websiteAnalysisId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: SEO analysis completed
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */ 