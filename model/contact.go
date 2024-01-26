package model

type Status struct {
	profilePictureHide bool
	phoneNumberHide    bool
	isBlocked          bool
}

type Contact struct {
	ID            uint   `json:"id" gorm:"primary_key;auto_increment;<-:create"`
	UserID        uint   `json:"userID" gorm:"foreignKey;not null"`
	ContactUserID uint   `json:"contactUserID" gorm:"foreignKey;not null"`
	Status        Status `json:"status"`
}

func NewContact(id, userID, contactUserID uint, status Status) *Contact {
	return &Contact{ID: id, UserID: userID, ContactUserID: contactUserID, Status: status}
}
