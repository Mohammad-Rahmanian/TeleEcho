package main

import (
	"TeleEcho/router"
	"fmt"
)

func main() {
	e := router.New()
	err := e.Start("localhost" + ":" + "8080")
	if err != nil {
		fmt.Printf("err:%s", err)
	}
}
