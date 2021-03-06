import React, {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import EventApi from '../../api/EventApi';
import EventPopup from './EventPopup';
import UserApi from "../../api/UserApi";

/**
 * This is a Calendar class that needs data props from the parent component - be it User 
 * or Project. This data would be used to display relevant events to on the calendar by setting
 * the calendarEvents state. 
 */
export default function Calendar() {
   
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [popupOpen, setPopupOpen] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [currentEvent, setCurrentEvent] = useState({});
    const [changesMade, setChangesMade] = useState(false);
    const [emailRemoved, setEmailRemoved] = useState(false);
    const [date, setDate] = useState("");
    const [purpose, setPurpose] = useState("");

    
    useEffect(() => {
        loadData();
        setDate("");
    }, [changesMade]);

    const loadData = async () => {
        await EventApi.getAllUserEvents().then(response => {
            const listOfEvents = response.data;
            setCalendarEvents(listOfEvents);
        })
    }

    const createEvent = (data) => {
        const usersToInvite = [];
        data.emails.forEach(email => UserApi.getUserByEmail(email).then(
            response => usersToInvite.push(response.data)
        ));
        const startDate = new Date(date);
        const startDateOutput = new Date(startDate.getFullYear(), startDate.getMonth(),
             startDate.getDate(), startDate.getHours(), startDate.getMinutes() + 60)
        const startInMillis = startDateOutput.getTime();
        const end = new Date(startInMillis + 30*6000);
        var endDateOutput = new Date(end.getFullYear(), end.getMonth(),
        end.getDate(), end.getHours(), end.getMinutes() + 60)
        const eventToAdd = {
            title: data.eventTitle,
            description: data.eventDescription,
            start: startDateOutput,
            end: endDateOutput,
            users: usersToInvite,
            allDay: false,
            editable: true
        }

        EventApi.create(eventToAdd)
                .then(response => setCalendarEvents([...calendarEvents, response.data]));
                loadData();
        setChangesMade(!changesMade);
    }

    const handleDateClick = (e) => {
        setPurpose('create');
        setDate(e.dateStr);
        setPopupOpen(true);
    };

    const handleEventClick = (info) => {
        setPurpose('update')
        setCurrentEvent(info.event);
        setChangesMade(!changesMade);
        setPopupOpen(true);
    }

    const handleEventChange = async (info) => {
        const startDate = new Date(info.event.start);
        var startDateOutput = new Date(startDate.getFullYear(), startDate.getMonth(),
             startDate.getDate(), startDate.getHours(), startDate.getMinutes() + 60)
        const end = new Date(info.event.end);
        var endDateOutput = new Date(end.getFullYear(), end.getMonth(),
        end.getDate(), end.getHours(), end.getMinutes() + 60)
        console.log(info);
        const updatedEvent = {
            id: info.event.id,
            title: info.event.title,
            description: info.event.extendedProps.description,
            start: startDateOutput,
            end: endDateOutput,
            users: info.event.extendedProps.users,
            creator: info.event.extendedProps.creator,
            bean: info.event.extendedProps.bean,
            meeting : info.event.extendedProps.meeting,
            allDay: info.event.allDay,
            editable: true
        }
        await EventApi.update(updatedEvent).then(response => {
            loadData();
            const eventAfterUpdate = response.data;
            calendarEvents.filter((e) => {
                if(e.id == eventAfterUpdate.id){
                    e = eventAfterUpdate
                }
            })
        });
        setChangesMade(!changesMade); 
    }

    const deleteEvent = async (toBeRemoved) => {
        const idToRemove = toBeRemoved.id;
        // eslint-disable-next-line no-unused-vars
        await EventApi.delete(idToRemove).then(() => { 
            loadData();
            var removeIndex = calendarEvents.findIndex(item => item.id == idToRemove);
            calendarEvents.splice(removeIndex, 1);
            }
        )
        setChangesMade(!changesMade);
    }

    const updateFromPopup = async (data) => {
        const startDate = new Date(currentEvent.start);
        var startDateOutput = new Date(startDate.getFullYear(), startDate.getMonth(),
             startDate.getDate(), startDate.getHours(), startDate.getMinutes() + 60)
        const end = new Date(currentEvent.end);
        var endDateOutput = new Date(end.getFullYear(), end.getMonth(),
        end.getDate(), end.getHours(), end.getMinutes() + 60)
        const updatedEvent = {
            id: currentEvent.id,
            title: data.eventTitle,
            description : data.eventDescription,
            start: startDateOutput,
            end: endDateOutput,
            users: currentEvent.extendedProps.users,
            creator: currentEvent.extendedProps.creator,
            bean : currentEvent.extendedProps.bean,
            meeting : currentEvent.extendedProps.meeting,
            allDay: currentEvent.allDay,
            editable: true,
        }
        await EventApi.update(updatedEvent).then((response) => {
            loadData();
            const eventAfterUpdate = response.data;
            calendarEvents.filter((e) => {
                if(e.id == eventAfterUpdate.id){
                    e = eventAfterUpdate
                }
            })
        })
        setChangesMade(!changesMade);
    }

    const popupClosed = (value) => {
        setPopupOpen(value);
        setCurrentEvent({});
    }

    const updateMembers = async (data) => {
        data.emails.forEach(async email => await EventApi
                        .inviteUserByEmail(data.currentEvent.id, email).then(() => loadData())
                        .catch(err => console.log(err))
                        );
        setChangesMade(!changesMade); 
    }

    // eslint-disable-next-line no-unused-vars
    const changesMadeChange = (changesMade) => {
        if(changesMade == true) {
            setChangesMade(false);
        } else {
            setChangesMade(true);
        }
    }


    //deletes the user after clcking X on a chip:
    const removeUser = async (data) => {
        const emailToRemove = data.nativeEvent.srcElement.parentElement.parentElement.innerText
        console.log("Email from removeUser in Calendar.js:", emailToRemove)
        await UserApi.getUserByEmail(emailToRemove)
                .then(async response => {
                    console.log("Response after getUserByEmail", response.data)
                    await EventApi.removeUser(currentEvent.id, response.data.email).then(() => {
                        loadData();
                    }).then(() => removeEmailFromMembers(currentEvent, emailToRemove))
                    .then(() => {
                        console.log("current email removed: " + emailRemoved)
                        if(emailRemoved == true) {
                            setEmailRemoved(false);
                        } else {
                            setEmailRemoved(true);
                        }
                        console.log("email removed set to: " + emailRemoved)
                    })
                    .catch(err => console.log(err))
                }).catch(err => console.log(err));
        setChangesMade(!changesMade);
    }

    const removeEmailFromMembers = (event, emailToRemove) => {
        const removeIndex = event.extendedProps.users
                        .map(user => user.email)
                        .findIndex(email => email == emailToRemove);
        console.log("index to remove from emails:", removeIndex);
        if(removeIndex > -1){
            event.extendedProps.users.splice(removeIndex, 1);
        }
        console.log("index removed")
    }
    
    return(
        <div  id="calendar">
        <FullCalendar
            initialView = "timeGridWeek"
            headerToolbar={{
                left: 'prev, next, today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            plugins = {[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            events = {calendarEvents}
            dateClick = {(e) => handleDateClick(e)}
            eventClick = {(info) => handleEventClick(info)}
            eventChange = {(info) => handleEventChange(info)}
        />
            <div className="event-popup">
                <div className="popup-container">
                <EventPopup isOpen = {popupOpen} 
                defaultOpen = {false}
                currentEvent = {currentEvent} 
                deleteEvent = {deleteEvent}
                updateEvent = {updateFromPopup}
                onMembersChange = {updateMembers}
                onClose = {popupClosed}
                onDelete = {removeUser}
                changesMade = {changesMade}
                emailRemoved = {emailRemoved}
                closeOnDocumentClick = {true}
                closeOnEscape = {false}
                createEvent = {createEvent}
                purpose = {purpose}
                />
                </div>
            </div>
    </div>
    );
}