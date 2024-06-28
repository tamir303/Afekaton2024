import UserService from "./UsersService.js"
import UserConverter from "../converters/UserConverter.js";
import Roles from "../../utils/UserRole.js";
import UserModel from "../../models/UserModel.js";

/**
 * @param {ObjectBoundary} objectBoundary
 * @type {{informRelatedProducers: ((function(*): Promise<void>)|*)}}
 */
const PostService = {
    informRelatedProducers: async (objectBoundary) => {
        const subjects = objectBoundary.objectDetails.subjects || []
        const userRequesting = objectBoundary.createdBy.userId

        console.log(userRequesting)

        const relatedUsers = await UserService.getAllUsers()
            .then(users => users.map(user => UserConverter.toBoundary(user))
                .filter(user => {
                    const userSubjects = user.userDetails.subjects || []
                    // Check if any subject in the commandModel is included in the user's subjects
                    return subjects.some(subject => userSubjects.includes(subject))
                        && user.role !== Roles.STUDENT;
                })
            );

        // Appending to notifications or creating the array if it doesn't exist
        relatedUsers.forEach(user => {
            const notifications = user.userDetails.notifications;

            if (notifications) {
                notifications.push(userRequesting);
            } else {
                user.userDetails.notifications = [userRequesting];
            }

            UserService.updateUser(user.userId.email, user.userId.platform, user)
        });
    }
}

export default PostService