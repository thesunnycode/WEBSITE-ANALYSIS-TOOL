/**
 * @swagger
 * /performance/{websiteAnalysisId}/analyze:
 *   post:
 *     summary: Analyze website performance
 *     tags: [Performance]
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
 *         description: Performance analysis completed
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 * 
 * /performance/{id}:
 *   get:
 *     summary: Get performance analysis results
 *     tags: [Performance]
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
 *         description: Performance analysis details
 *       404:
 *         description: Analysis not found
 */ 