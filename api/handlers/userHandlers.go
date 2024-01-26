package handlers

import (
	"TeleEcho/api/database"
	"crypto/sha256"
	"encoding/hex"
	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
	"net/http"
)

func RegisterUser(c echo.Context) error {
	username := c.FormValue("username")
	firstname := c.FormValue("firstname")
	lastname := c.FormValue("lastname")
	phone := c.FormValue("phone")
	password := c.FormValue("password")
	profilePicture := c.FormValue("profile")
	bio := c.FormValue("bio")
	hashFunc := sha256.New()
	hashFunc.Write([]byte(password))
	hashPassword := hex.EncodeToString(hashFunc.Sum(nil))
	ok := database.IsUsernameDuplicate(username)
	if ok {
		err := database.CreateUser(username, firstname, lastname, phone, hashPassword, profilePicture, bio)
		if err != nil {
			logrus.Printf("Error creating user:%s\n", err)
			return c.JSON(http.StatusInternalServerError, "Can not create user")
		}
		return c.JSON(http.StatusCreated, "User created successfully")
	} else {
		return c.JSON(http.StatusBadRequest, "Your username has already been used")
	}

}
