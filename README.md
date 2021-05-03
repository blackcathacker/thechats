# The CHATS chat server

`The CHATS` is a simple TCP/IP based chat server generally using telnet. Supports:
* Multiple clients
* Multiple chat rooms
* Persistent logging of commands and messages
* REST API for posting messages and querying persist log

*BUT* this is a toy. It likely has bugs I haven't found. LOTS of error handling hasn't been added. Definitely needs more test coverage on the features completed near the end. Most importantly you can't really quit a chat session (`:quit` exists, but doesn't totally work, exit out of most telnet clients with `^]quit`).

## Getting Started

* Requires Node v14 or greater
* Install dependencies
```
npm install
```
* Modify `config.json` to suit needs
  * config.json supports setting the telnet port, http port and ip address the server will listen on as well as what log file will be used to log messages and read as a persistent data store
* Start the server
```
> npm start
opened server on { address: '127.0.0.1', family: 'IPv4', port: 1337 }
```

Assuming the default config you can now `telnet localhost 1337` and begin to use the chat server.

## Usage

```
> telnet localhost 1337
Welcome to THE CHATS server 127.0.0.1:62147.
Available commands:
    :name <Your name>
        Sets the name that will be displayed when you send messages.
    :createRoom <New Room Name>
        Creates new chatroom
    :listRooms
        Show list of all rooms that currently exist
    :gotoRoom <Room Name>
        Switch current chatroom
    :who
        List users in the current chatroom
    <Message>
        Send a message
```

All commands and messages expect ASCII characters and have not been testing using unicode or un-readable characters. All commands start with a `:` character and are case insensitive.

Each command and message through the telnet interface are expected to end with a newline character.

The following commands and input are available to all clients:

* Messages
  * Any string that does not start with a `:` is considered a chat message. This will broadcast a message to any other clients in the same chat room.
```
> telnet localhost 1337
Hello Everyone!
```
Other clients
```
5/2/2021, 9:27:44 PM [127.0.0.1:61736] : Hello Everyone!
```

* :name <ins>New_Name</ins>
  * This will update the current clients name too `New Name`. Currently there are no restrictions or validations on names. Changing ones name will broadcast to the current room that the name has been changed.
```
:name IamBlackcat
```
Other clients
```
5/2/2021, 9:59:28 PM [IamBlackcat] : 127.0.0.1:62244 has renamed themselves to IamBlackcat
```

* :createRoom <ins>New_Room_Name</ins>
  * This creates a new chat room named `New Room Name`. The current user will automatically be placed into the newly created room.
```
:createRoom My Fancy Room
Now in room My Fancy Room
```

* :listrooms
  * Lists chat rooms currently available on this server to the current client. The current room will be identified by a `*`
```
:listRooms
List of currently available chat rooms
 - default
 - My Fancy Room *
```

:gotoRoom <ins>Room Name</ins>
  * Moves the current client into `Room Name` chat room.
```
:gotoRoom My Fancy Room
You are now in My Fancy Room
```

:who
  * Lists the users in the current chat room. The current user will be identified by a `*`
```
:who
Users in My Fancy Room
 - Client 123 *
 - Client 1
```

## REST APIs

* `GET /?[q=queryString]`
  * Returns a list of all chat messages and associated meta-data. Takes an optional query parameter of `q`. When provided will filter messages to chat messages that contains `queryString`.
```
[
    {
        "clientId": "127.0.0.1:59414",
        "clientName": "MyNewName",
        "timestamp": 1620004703895,
        "message": "Hello"
    },
    {
        "clientName": "ApiUser",
        "timestamp": 1620006401927,
        "message": "Hello hello everyone!"
    }
]
```

* `POST /`
  * Posts a message to the designated chat room. Takes an `application/json` payload matching the following form. Not providing all properties specificed will result in unknown behavior.
  * On success will return a status code of 200 and the message `Message sent` in the response body.
```
{
    "name": "ApiUser",
    "room": "My Fancy Room",
    "message": "Hello hello everyone from the WWWs!"
}
```

## Development

Tests are available and can be run using either
```
npm run test
```
or
```
npm run watch-tests
```