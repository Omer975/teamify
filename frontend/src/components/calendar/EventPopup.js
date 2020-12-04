/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import Tags from './Tags';
import Chips from './Chips';


// eslint-disable-next-line react/prop-types
export default function EventPopup({    isOpen,
                                        currentEvent,
                                        updateEvent,
                                        onClose,
                                        deleteEvent,
                                        onMembersChange,
                                        onDelete,
                                        changesMade }) {


    const [event, setEvent] = useState(currentEvent)
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [eventMembersEmails, setEventMembersEmails] = useState([]);
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        console.log("chages made noticed in the event popup:", changesMade)
        setEvent(currentEvent);
        if(currentEvent !== {}){
            const {
                id,
                title,
                extendedProps,
            } = currentEvent;
            setEventTitle(title);
            if(extendedProps !== undefined){
                setEventDescription(extendedProps.description);
                const eventMembersEmailsFromProps = extendedProps.users.map(user => user.email);
                console.log("setting eventMembersEmails to", eventMembersEmailsFromProps);
                setEventMembersEmails(eventMembersEmailsFromProps);
                console.log("eventMembersEmails set to", eventMembersEmails);
            }
        }
    }, [event, changesMade]);

    useEffect(() => {
        setEmails(emails);
    }, []);

    const onEmailsChange = (updatedEmails, eventToUpdate) => {
        console.log("onEmailsChange from event popup:", updatedEmails);
        setEmails(updatedEmails);
    }
    //generates the chips with emails of invited users
    // eslint-disable-next-line react/jsx-key
    const chips = currentEvent !== {} ? 
    eventMembersEmails.map(email => <Chips email = {email} 
                                    handleDelete = {onDelete}
                                    changesMade = {changesMade}
                                    />)
                        :
                        null;

    // eslint-disable-next-line react/prop-types
    return (
        <div className="create-bean-card">
            <div className="popup-container">
                <Popup
                    open = {isOpen}
                    modal
                    nested>
                        {close => (
                        <div className="modal">
                            <button className="close" onClick={()=> {
                                close();
                                onClose(false);
                                }    
                        }>
                                <i className="fas fa-times"></i>
                            </button>
                            <div className="content">
                                <div className="popup-item flex-start">
                                    <h2 className="prompt">Title</h2>
                                    <input
                                        type="text"
                                        className="input-box"
                                        value={eventTitle}
                                        placeholder="title"
                                        onChange = {e => {
                                            setEventTitle(e.target.value);
                                        }}
                                    >
                                    </input>
                                </div>
                                <div className="popup-item flex-start">
                                    <h2 className="prompt">Description</h2>
                                    <textarea
                                        className="input-box"
                                        placeholder=""
                                        value = {eventDescription}
                                        onChange = {e => {
                                            setEventDescription(e.target.value);
                                        }}
                                    >
                                    </textarea>
                                </div>
                                <div className="popup-item flex-start">
                                    <h2 className="prompt">Members of the event:</h2>
                                        <div className="popup-item flex-start">
                                            {chips}
                                        </div>
                                </div>
                                <div className="popup-item flex-start">
                                    <h2 className="prompt">Invite user by email</h2>
                                    <Tags event = {currentEvent} onEmailsChange = {onEmailsChange}/>
                                </div>
                            </div>
                            <div className="flex-end">
                                <button
                                className="button"
                                onClick={() => {
                                    {updateEvent({ eventTitle, eventDescription })}
                                    {onMembersChange({emails, currentEvent})}
                                    close();
                                    {onClose(false)}
                                }}>
                                Update
                                </button>
                                <button
                                className="button"
                                onClick={() => {
                                    {deleteEvent(currentEvent)}
                                    close();
                                    {onClose(false)}
                                }}>
                                Delete
                                </button>
                            </div>
                        </div>
                    )}
                </Popup>
            </div>
        </div>
    );
}