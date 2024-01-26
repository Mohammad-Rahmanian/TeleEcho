package router

import (
	"TeleEcho/api/handlers"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func New() *echo.Echo {
	e := echo.New()
	e.Use(middleware.Recover())
	e.POST("/register", handlers.RegisterUser)
	return e
}
