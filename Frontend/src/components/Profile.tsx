import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {isAuthenticated, getToken, removeToken} from './AuthHelper';
import './css/Profile.css';
import LoadingSpinner from "./LoadingSpinner";
import groupIcon from "../assets/group.png";
import contactIcon from "../assets/contact.png";
import editIcon from "../assets/edit.png";
import deleteIcon from "../assets/delete_icon.png";
import cancelIcon from "../assets/cancel.png";
import chatIcon from "../assets/chat.png";


interface User {
    username: string;
    firstname: string;
    lastname: string;
    phone: string;
    Bio: string;
    profilePicture?: string;
}

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);

    interface CardContentProps {
        field: string;
        initialValue: string;
    }

    interface CardContentProps {
        field: string;
        initialValue: string;
        saveChanges: (updatedUserInfo: { [key: string]: string }) => Promise<void>;
        setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
        isEditing: boolean;
    }

    const handleEditClick = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setEditingField(null);
        }
    };

    const CardContent: React.FC<CardContentProps> = ({
                                                         field,
                                                         initialValue,
                                                         saveChanges,
                                                         setEditingField,
                                                         isEditing
                                                     }) => {
        const [value, setValue] = useState(initialValue);
        const [isFieldEditing, setIsFieldEditing] = useState(false);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        };

        const handleSave = async () => {
            await saveChanges({[field]: value});
            setEditingField(null);
        };


        const handleEditClick = () => {
            setIsFieldEditing(true);
            setEditingField(field);
        };

        const handleCancel = () => {
            setIsFieldEditing(false);
            setEditingField(null);
            setValue(initialValue); // Reset value to initial
        };

        return (
            <div className={`detail-card ${field}-card`}>
                {isFieldEditing ? (
                    <>
                        <input type="text" value={value} onChange={handleInputChange}/>
                        <div>
                            <button onClick={handleSave}>Save</button>
                            <button onClick={handleCancel}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <p>{value}</p>
                        {isEditing && <button onClick={handleEditClick}>Edit</button>}
                    </>
                )}
            </div>
        );
    };


    const saveChanges = async (updatedUserInfo: any, isProfilePic = false) => {
        try {
            let formData = new FormData();

            if (isProfilePic) {
                formData = updatedUserInfo as FormData;
            } else {
                for (const key in updatedUserInfo) {
                    formData.append(key, updatedUserInfo[key]);
                }
            }

            const token = getToken();
            const response = await fetch('http://127.0.0.1:8020/users', {
                method: 'PATCH',
                headers: {
                    'Authorization': `${token}`,
                },
                body: formData
            });

            if (response.ok) {
                console.log("User information updated successfully");
                // Handle successful response
            } else {
                // Handle errors
                const errorData = await response.json();
                console.error("Error updating user information:", errorData);
            }
        } catch (error) {
            console.error("Error in API request:", error);
        }
    };


    const deleteUser = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                const token = getToken();
                const response = await fetch('http://127.0.0.1:8020/users', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `${token}`,
                    },
                });

                if (response.ok) {
                    console.log("User deleted successfully");
                    removeToken()
                    navigate('/login');
                } else {
                    // Handle errors
                    const errorData = await response.json();
                    console.error("Error deleting user:", errorData);
                }
            } catch (error) {
                console.error("Error in API request:", error);
            }
        }
    };


    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        const fetchUserInfo = async () => {
            try {
                const token = getToken();
                const response = await fetch('http://127.0.0.1:8020/users', {
                    method: 'GET',
                    headers: {
                        'Authorization': ` ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.profilePicture && !data.profilePicture.startsWith('http')) {
                        data.profilePicture = `data:image/png;base64,${data.profilePicture}`;
                    }
                    setUser(data);
                } else {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        handleServerError(data);
                    } else {
                        const text = await response.text();
                        handleServerError({error: text});
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                setErrorMessage('An error occurred while fetching user information.');
            }
        };

        fetchUserInfo();
    }, [navigate]);

    const handleServerError = (data: any) => {
        setErrorMessage('Invalid token. Redirecting to login...');

        const timeoutId = setTimeout(() => {
            navigate('/login');
        }, 2000);

        return () => clearTimeout(timeoutId);
    };

    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];

            const formData = new FormData();
            formData.append('profile', file);

            saveChanges(formData, true);
        }
    };


    if (errorMessage) {
        return <div className="profile-container error-container">
            <div className="alert alert-danger">
                {errorMessage}
            </div>
        </div>;
    }

    if (!user) {
        return <LoadingSpinner/>;
    }


    return (

        <div className="profile-container">
            <button className="navigate-first" onClick={() => navigate('/group')}>
                <img src={groupIcon} alt="Profile"/>
            </button>
            <button className="navigate-second" onClick={() => navigate('/contacts')}>
                <img src={contactIcon} alt="Contacts"/>
            </button>
            <button className="navigate-third" onClick={() => navigate('/chats')}>
                <img src={chatIcon} alt="Chat"/>
            </button>
            <div className="profile-picture-edit-container">
                {user.profilePicture && (
                    <img src={user.profilePicture} alt={`${user.firstname} ${user.lastname}`}
                         className="profile-picture"/>
                )}
                {isEditing && (
                    <>
                        <input type="file" id="profile-picture-input" style={{display: 'none'}}
                               onChange={handleProfilePictureChange}/>
                        <label htmlFor="profile-picture-input" className="btn btn-secondary">
                            Change Profile Picture
                        </label>
                    </>
                )}
            </div>
            <div className="buttons-container">
                <button className="add-button-first" onClick={handleEditClick}>
                    {isEditing ? <img src={cancelIcon} alt="Profile"/> : <img src={editIcon} alt="Profile"/>}
                </button>
                <button className="add-button-second" onClick={deleteUser}>
                    <img src={deleteIcon} alt="Profile"/>
                </button>
            </div>

            <div className="details-container">
                <CardContent
                    field="firstname"
                    initialValue={user.firstname}
                    saveChanges={saveChanges}
                    setEditingField={setEditingField}
                    isEditing={isEditing}
                />
                <CardContent
                    field="lastname"
                    initialValue={user.lastname}
                    saveChanges={saveChanges}
                    setEditingField={setEditingField}
                    isEditing={isEditing}
                />
            </div>

            <div className="details-container">
                <CardContent
                    field="username"
                    initialValue={user.username}
                    saveChanges={saveChanges}
                    setEditingField={setEditingField}
                    isEditing={isEditing}
                />
                <CardContent
                    field="phone"
                    initialValue={user.phone}
                    saveChanges={saveChanges}
                    setEditingField={setEditingField}
                    isEditing={isEditing}
                />
            </div>
            <div className="bio-card">
                <CardContent
                    field="bio"
                    initialValue={user.Bio}
                    saveChanges={saveChanges}
                    setEditingField={setEditingField}
                    isEditing={isEditing}
                />
            </div>
        </div>
    );


};
export default Profile;
