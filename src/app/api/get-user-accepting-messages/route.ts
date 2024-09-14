import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  await dbConnect();

  const { username } = await req.json();

  try {
    const user = await UserModel.findOne({ username: username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 200 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User not accepting messages",
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User's message acceptance status updated successfully",
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("Error while sending message: " + err);

    return Response.json(
      {
        success: false,
        message: "Error while getting status of message",
      },
      { status: 500 }
    );
  }
}
