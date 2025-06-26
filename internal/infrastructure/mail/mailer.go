package mail

import (
    "fmt"
)

func SendMail(to, subject, body string) error {
    // TODO: integrate SMTP or external service
    fmt.Printf("Sending mail to %s: %s - %s
", to, subject, body)
    return nil
}
