package database

import (
	"TeleEcho/configs"
	"TeleEcho/model"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() error {
	var err error
	dsn := "host=" + configs.Config.DatabaseAddress + " user=" + configs.Config.DatabaseUser + " password=" + configs.Config.DatabasePassword +
		" dbname=" + configs.Config.DatabaseName + " port=" + configs.Config.DatabasePort
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logrus.Printf("Failed to connect to database:%s", err)
		return err
	}
	err = DB.AutoMigrate(&model.User{})
	err = DB.AutoMigrate(&model.Contact{})
	err = DB.AutoMigrate(&model.Group{})
	err = DB.AutoMigrate(&model.UserGroup{})
	err = DB.AutoMigrate(&model.DirectChat{})
	err = DB.AutoMigrate(&model.GroupChat{})
	err = DB.AutoMigrate(&model.Message{})
	if err != nil {
		logrus.Printf("Failed to migrate database:%s", err)
		return err
	}
	return nil

}

func CreateUser(username, firstname, lastname, phone, password, profilePicture, bio string) error {
	userData := &model.User{Username: username, Firstname: firstname, Lastname: lastname, Phone: phone,
		Password: password, ProfilePicture: profilePicture, Bio: bio}
	if err := DB.Create(userData).Error; err != nil {
		logrus.Printf("Error creating user:%s\n", err)
		return err
	}
	logrus.Printf("User created\n")
	return nil

}
