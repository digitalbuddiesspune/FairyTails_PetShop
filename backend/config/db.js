import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.DBURL;
        
        if (!mongoURI) {
            console.error('❌ DBURL is not defined in .env file');
            process.exit(1);
        }
        
        console.log('Connecting to MongoDB Atlas...');
        
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB successfully!');
        console.log('📁 Database:', mongoose.connection.db.databaseName);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
