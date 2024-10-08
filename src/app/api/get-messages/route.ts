import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const _user: User = session?.user as User;
  console.log("Session User: " + JSON.stringify(_user));
  
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messageList" },
      { $sort: { "messageList.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messageList" },
        },
      },
    ]);

    if (!user || user.length == 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        messageList: user[0].messages,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error while getting messages: " + err);

    return Response.json(
      {
        success: false,
        message: "Error while getting messages",
      },
      { status: 500 }
    );
  }
}
