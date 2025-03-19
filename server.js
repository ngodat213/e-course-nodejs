// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const courseRoutes = require('./src/routes/course.routes');
const lessonRoutes = require('./src/routes/lesson.routes');
const lessonContentRoutes = require('./src/routes/lesson_content.routes');
const examRoutes = require('./src/routes/exam.routes');
const cartRoutes = require('./src/routes/cart.routes');
const orderRoutes = require('./src/routes/order.routes');
const categoryRoutes = require('./src/routes/category.routes');
const reviewRoutes = require('./src/routes/review.routes');
const userProgressRoutes = require('./src/routes/user_progress.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/lesson-contents', lessonContentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/progress', userProgressRoutes); 