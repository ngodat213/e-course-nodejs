/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Quản lý danh mục khóa học
 * 
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của danh mục
 *         name:
 *           type: string
 *           description: Tên danh mục
 *         description:
 *           type: string
 *           description: Mô tả danh mục
 *         parent_id:
 *           type: string
 *           description: ID của danh mục cha (null nếu là danh mục gốc)
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Trạng thái danh mục
 *         order:
 *           type: number
 *           description: Thứ tự sắp xếp
 *         icon:
 *           type: string
 *           description: URL của icon danh mục
 *         course_count:
 *           type: number
 *           description: Số lượng khóa học trong danh mục
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Lấy danh sách danh mục
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục cha
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *
 *   post:
 *     tags: [Categories]
 *     summary: Tạo danh mục mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên danh mục
 *               description:
 *                 type: string
 *                 description: Mô tả danh mục
 *               parent_id:
 *                 type: string
 *                 description: ID của danh mục cha
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               order:
 *                 type: number
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền tạo danh mục
 *
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Lấy chi tiết danh mục
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy danh mục
 *
 *   put:
 *     tags: [Categories]
 *     summary: Cập nhật danh mục
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               order:
 *                 type: number
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền cập nhật
 *       404:
 *         description: Không tìm thấy danh mục
 *
 *   delete:
 *     tags: [Categories]
 *     summary: Xóa danh mục
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
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền xóa
 *       404:
 *         description: Không tìm thấy danh mục
 *
 * /api/categories/{id}/courses:
 *   get:
 *     tags: [Categories]
 *     summary: Lấy danh sách khóa học theo danh mục
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng items mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -created_at
 *         description: Sắp xếp (ví dụ -created_at, price)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: published
 *         description: Lọc theo trạng thái khóa học
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       404:
 *         description: Không tìm thấy danh mục
 */ 