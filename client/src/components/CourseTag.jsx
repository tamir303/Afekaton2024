import React from 'react';
import { Chip } from '@material-ui/core';

const CourseTag = ({ coursesName }) => {
    return (
        <div>
            {coursesName.map((courseName, index) => (
                <Chip key={index} label={courseName} />
            ))}
        </div>
    );
};

export default CourseTag;