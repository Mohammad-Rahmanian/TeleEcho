import React, { useState, useEffect } from 'react';
import './css/ContactsPage.css';
import { useNavigate } from 'react-router-dom'; // Import useHistory from react-router-dom
import deleteIcon from '../assets/delete_icon.png';
import profileIcon from '../assets/profile.png'; // Import your profile icon



interface Contact {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    phone: string;
}

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

    useEffect(() => {
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
                    setError('Data format is incorrect');
                }
            })
            .catch(error => setError(error.message));
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
                // Parse the JSON response body
                return response.json().then(data => {
                    if (response.ok) {
                        // Handle success
                        setSuccessMessage('Contact added successfully');
                        setShowAddContactForm(false);
                        setNewContactPhone('');
                    } else {
                        // Handle errors, check if the response has an "error" key
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

    const deleteContact = (username: string) => {
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
        <div className="contacts-page">
            <button className="navigate-profile" onClick={navigateToProfile}>
                <img src={profileIcon} alt="Profile"/>
            </button>
            <div className="add-contact-container">
                <button className="add-contact" onClick={() => setShowAddContactForm(!showAddContactForm)}>+</button>
                {showAddContactForm && (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            placeholder="Enter phone number"
                        />
                        <button type="submit" className="create-contact">Create Contact</button>
                    </form>
                )}
            </div>
            <ul className="chat-list">
                {contacts.map(contact => (
                    <li key={contact.id} className="contact-card">
                        <div className="contact-info">
                            <div className="name">{contact.firstname} {contact.lastname}</div>
                            <div className="details">@{contact.username} | {contact.phone}</div>
                        </div>
                        <button onClick={() => deleteContact(contact.username)} className="delete-button">
                            <img src={deleteIcon} alt="Delete"/>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

};

export default ContactsPage;
