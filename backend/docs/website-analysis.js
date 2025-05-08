/**
 * @swagger
 * /website-analysis:
 *   post:
 *     summary: Create a new website analysis
 *     tags: [Website Analysis]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Website URL to analyze
 *     responses:
 *       201:
 *         description: Analysis created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get all website analyses
 *     tags: [Website Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of analyses
 *       401:
 *         description: Unauthorized
 * 
 * /website-analysis/{id}:
 *   get:
 *     summary: Get a specific website analysis
 *     tags: [Website Analysis]
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
 *         description: Analysis details
 *       404:
 *         description: Analysis not found
 */