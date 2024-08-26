import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function DELETE(
  req: Request,
  param: {
    params: {
      params: { messageId: string };
    };
  }
) {
  const messageId = param.params.params.messageId;

  await dbConnect();

  const session = await getServerSession(authOptions);

  const _user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const result = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messageList: { _id: messageId } } }
    );

    if (result.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error while deleting message" + JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
