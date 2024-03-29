import React, {useState, useEffect} from 'react';
import './css/ContactsPage.css';
import {useNavigate} from 'react-router-dom'; // Import useHistory from react-router-dom
import deleteIcon from '../assets/delete_icon.png';
import profileIcon from '../assets/profile.png'; // Import your profile icon
import groupIcon from '../assets/group.png';
import {getToken} from "./AuthHelper";
import chatIcon from "../assets/chat.png"; // Import your profile icon


interface Contact {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    phone: string;
}

interface ModalProps {
    show: boolean;
    onClose: () => void;
    onAddContact: (e: React.FormEvent<HTMLFormElement>) => void;
    newContactPhone: string;
    handleNewContactPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Modal: React.FC<ModalProps> = ({show, onClose, onAddContact, newContactPhone, handleNewContactPhoneChange}) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4 className="modal-title">Add New Contact</h4>
                </div>
                <div className="modal-body">
                    <form onSubmit={onAddContact}>
                        <input
                            type="text"
                            value={newContactPhone}
                            onChange={handleNewContactPhoneChange}
                            placeholder="Enter phone number"
                        />
                        <button type="submit" className="create-contact">Create Contact</button>
                    </form>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="button">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const ContactsPage = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showAddContactForm, setShowAddContactForm] = useState(false);
    const [newContactPhone, setNewContactPhone] = useState('');
    const navigate = useNavigate(); // useNavigate hook for navigation

    const navigateToProfile = () => {
        navigate('/profile');
    };

    const navigateToGroups = () => {
        navigate('/group');
    };

    const navigateToChats = async ({contactId}: { contactId: any }) => {
        const receiverID = contactId.toString(); // Assuming `contactId` is available in this scope

        try {
            const response = await fetch('http://127.0.0.1:8020/chat', {
                method: 'POST',
                headers: {
                    'Authorization': '' + getToken(), // Adjust based on actual token retrieval method
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ receiverID }).toString(), // Correctly format the body data
            });

            // navigate(`/chat/${chatId}`); // Navigate to the chat page using the returned chatId
            if (response.ok) {
            } else {
                // Handle errors if the request wasn't successful
                const errorData = await response.json();
                console.error(errorData.error || 'An error occurred while creating the chat.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        navigate('/chats'); // Update this to the correct path for your ChatsPage
    };



    const fetchContacts = () => {
        fetch('http://127.0.0.1:8020/contacts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '' + localStorage.getItem('token'),
            },
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setContacts(data);
                } else {
                    setError('the contact list is empty');
                }
            })
            .catch(error => setError(error.message));
    };


    useEffect(() => {
        fetchContacts();
    }, []);

    const toggleAddContactForm = () => {
        setShowAddContactForm(!showAddContactForm);
    };

    const handleNewContactPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewContactPhone(e.target.value);
    };

    const handleAddContact = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError('');
        setSuccessMessage('');

        fetch('http://127.0.0.1:8020/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': '' + localStorage.getItem('token'),
            },
            body: `phone=${encodeURIComponent(newContactPhone)}`
        })
            .then(response => {
                return response.json().then(data => {
                    setShowAddContactForm(false);
                    if (response.ok) {
                        // Handle success
                        setSuccessMessage('Contact added successfully');
                        setNewContactPhone('');
                        fetchContacts(); // Refresh the contact list

                    } else {
                        if (data && data.error) {
                            throw new Error(data.error);
                        } else {
                            throw new Error('An error occurred while adding the contact.');
                        }
                    }
                });
            })
            .catch(error => {
                // Display errors
                setError(error.message);
            });
    };

    const deleteContact = ({event, username}: { event: any, username: any }) => {
        event.stopPropagation(); // Prevent the click from bubbling up to parent elements

        if (window.confirm('Are you sure you want to delete this contact?')) {
            fetch(`http://127.0.0.1:8020/contacts?username=${encodeURIComponent(username)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': '' + localStorage.getItem('token'),
                },
            })
                .then(response => {
                    if (response.ok) {
                        setSuccessMessage('Contact deleted successfully');
                        // Remove the contact from the state
                        setContacts(contacts.filter(contact => contact.username !== username));
                    } else {
                        return response.json().then(data => {
                            if (data && data.error) {
                                throw new Error(data.error);
                            }
                            throw new Error('An error occurred while deleting the contact.');
                        });
                    }
                })
                .catch(error => setError(error.message));
        }
    };

    return (
        <div className="centered-contact-list">
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <ul className="contacts-container">
                {contacts.map(contact => (
                    <li key={contact.id} className="contact-card"
                        onClick={() => navigateToChats({contactId: contact.id})}>
                        <div className="contact-info">
                            <div className="name">{contact.firstname} {contact.lastname}</div>
                            <div className="details">@{contact.username} | {contact.phone}</div>
                        </div>
                        <button onClick={(e) => deleteContact({event: e, username: contact.username})}
                                className="delete-button">
                            <img src={deleteIcon} alt="Delete"/>
                        </button>
                    </li>
                ))}
            </ul>

            {/* Other elements like navigation buttons and add contact form */}
            <button className="navigate-first" onClick={navigateToProfile}>
                <img src={profileIcon} alt="Profile"/>
            </button>
            <button className="navigate-second" onClick={navigateToGroups}>
                <img src={groupIcon} alt="Groups"/>
            </button>
            <button className="navigate-third" onClick={() => navigate('/chats')}>
                <img src={chatIcon} alt="Chat"/>
            </button>
            <div className="add-contact-container">
                <button className="add-button-first" onClick={() => setShowAddContactForm(!showAddContactForm)}>+
                </button>
                <Modal
                    show={showAddContactForm}
                    onClose={() => setShowAddContactForm(false)}
                    onAddContact={handleAddContact}
                    newContactPhone={newContactPhone}
                    handleNewContactPhoneChange={handleNewContactPhoneChange}
                />
            </div>
        </div>
    );
};

export default ContactsPage;
