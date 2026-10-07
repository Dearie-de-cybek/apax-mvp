import mongoose from "mongoose";

const connectDatabase = async (uri: string): Promise<void> => {
  await mongoose.connect(uri);
  console.log("Mongoose Connected");
};

export default connectDatabase;
