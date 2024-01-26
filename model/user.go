package model

type User struct {
	ID        uint   `json:"id" gorm:"primary_key;auto_increment;<-:create"`
	Username  string `json:"username,omitempty" gorm:"unique"`
	Firstname string `json:"firstname,omitempty"`
	Lastname  string `json:"lastname,omitempty"`
	Phone     string `json:"phone,omitempty" gorm:"unique"`
	Password  string `json:"password,omitempty"`
	Image     string `json:"image,omitempty" gorm:"unique"`
	Bio       string `json:"Bio,omitempty"`
}

func NewUser(id uint, username, firstname, lastname, phone, password, image, bio string) *User {
	return &User{ID: id, Username: username, Firstname: firstname, Lastname: lastname, Phone: phone, Password: password, Image: image, Bio: bio}
}
