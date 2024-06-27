import CommandModel from "../../models/CommandModel.js"; // Importing the Command Model
import UserService from "./UsersService.js"
import UserBoundary from "../../boundaries/user/UserBoundary.js";
import UserConverter from "../converters/UserConverter.js";
import CommandConverter from "../converters/CommandConverter.js";

const PostService = {
    informRelatedProducers: async (commandModel: Promise<CommandModel>) => {
         const subjects: String[] = await commandModel
             .then(commands => CommandConverter.toBoundary(commands))
             .then(command => command.commandAttributes.get("subjects"))

        const user: UserBoundary = await commandModel
            .then(commands => CommandConverter.toBoundary(commands))
            .then(command => command.invokedBy)

        const relatedUsers: UserBoundary[] = await UserService.getAllUsers()
            .then(users => users.map(user => UserConverter.toBoundary(user))
                .filter(user => {
                    const userSubjects = user.userDetails.get("subjects");
                    // Check if any subject in the commandModel is included in the user's subjects
                    return subjects.some(subject => userSubjects.includes(subject));
                })
            );

        // Appending to notifications or creating the array if it doesn't exist
        relatedUsers.forEach(user => {
            const notifications = user.userDetails.get("notifications");
            const newNotification = user.userId // User requesting help

            if (notifications) {
                notifications.push(newNotification);
            } else {
                user.userDetails.set("notifications", [newNotification]);
            }
        });
    }
}