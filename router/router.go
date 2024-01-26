package router

import (
	"github.com/labstack/echo"
)

func New() *echo.Echo {
	e := echo.New()
	return e
}
