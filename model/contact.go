package model

type Contact struct {
	UserID      uint   `json:"userID" gorm:"primary_key"`
	ContactID   uint   `json:"contactID" gorm:"primary_key"`
	ContactName string `json:"contactName,omitempty"`
}

func NewContact(userID, contactID uint, contactName string) *Contact {
	return &Contact{UserID: userID, ContactID: contactID, ContactName: contactName}
}
