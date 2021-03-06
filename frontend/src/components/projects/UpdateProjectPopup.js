import React from "react";
import Popup from "reactjs-popup";
import EditableText from "./EditableText";
// import Popup from "reactjs-popup";
import { motion } from "framer-motion";

// eslint-disable-next-line react/prop-types
export default function UpdateProjectPopup({ isOpen, currentProject, updateProject, onClose }) {

    const {
        id, title, categoryPositioning, teamBeanScore
    } = currentProject;
   

    // const [taskMembers, setTaskMembers] = useState("");
    //const [taskComments, setTaskComments] = useState([]);

    const onTitleUpdated = (newTitle) => {
        const updatedProject = {
            id,
            title: newTitle,
            categoryPositioning,
            teamBeanScore
        };
        updateProject(updatedProject);
    }


    return (
        <div className="task-popup popup-container">
            <Popup open={isOpen} modal nested onClose={onClose}>
                <motion.div  initial={{
                     scale: 0
                         }}
                     animate= {{
                     scale: 1
                     }} className="modal">
                    
                    <button className="close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>

                    <div className="header1">
                        <h2 className="header1-title">Edit project detail</h2>

                    </div>
                    <div className="content">
                        <div className="popup-item flex-start">
                            <h2 className="prompt">Title</h2>
                            <EditableText
                                text={title}
                                placeholder="title"
                                onUpdateText={onTitleUpdated} />
                        </div>
                    </div>
                </motion.div>
            </Popup>
        </div>
    );
}