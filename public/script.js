const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})

/********************************************Video/Text Chat Handlers Begin********************************************/

let myVideoStream;
const peers = {}

const myVideo = document.createElement('video')
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    //Adds the Video Stream of the User themselves.
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })

    })

    //Connects to the New User Joining In and generates an alert too.
    socket.on('user-connected', userId => {
        console.log('New User Connected: ' + userId)

        $("ul").append(`<li align=center class="message"><b>User ID ${userId} Connected!</b></li>`);
        scrollToBottom()
        const fc = () => connectToNewUser(userId, stream)
        timerid = setTimeout(fc, 1000)
    })

    //Initializes the var text to the input chat message
    let text = $("input");

    //Sends the Chat message when Enter key is pressed
    $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    });

    socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>Someone:</b><br/>${message}</li>`);
        scrollToBottom()
    })
})

//Closes the connection with disconnected user and generates and Alert message too.
socket.on('user-disconnected', userId => {
    if (peers[userId]) {
        peers[userId].close()
        $("ul").append(`<li align=center class="message"><b>User ID ${userId} Disonnected!</b></li>`);
        scrollToBottom()
    }
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

//Auxilliary Function for connecting to new user
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

//Auxilliary Function for adding video stream of call participants
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
    scrollToBottomVideos()
}

/*********************************************Video/Text Chat Handlers End*********************************************/


/**********************************************Auto Scroll Handlers Begin**********************************************/

//Auto-Scrolling to the bottom of the chat window.
const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

//Auto-Scrolling to the bottom of the Video Panel.
const scrollToBottomVideos = () => {
    var d = $('.main__videos');
    d.scrollTop(d.prop("scrollHeight"));
}

/***********************************************Auto Scroll Handlers End***********************************************/


/*********************************************Control Panel Handlers Begin*********************************************/

//Handles mic Mute/Unmute functionality
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

//Handles Video On/Off Functionality
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

//Handles the Copy to clipboard Functionality
$('.clipboard').on('click', function() {
    var $temp = $("<input>");
    var $url = $(location).attr('href');
    $("body").append($temp);
    $temp.val($url).select();
    document.execCommand("copy");
    $temp.remove();
    setLinkCopied()
})

//Handles the Start New Meeting Functionality
const new_meeting = () =>{
    location.href = "https://connect-interact.herokuapp.com";
}

/**********************************************Control Panel Handlers End**********************************************/


/**********************************************UI Response Handlers Begin**********************************************/

//Handle the UI Response for Mute/Unmute
const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
  document.querySelector('.main__mute_button').innerHTML = html;
}

//Handle the UI Response for Video On/Off
const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

//Handle the UI Response to Copy to Clipboard Functionality
const setLinkCopied = () => {
    const html = `
        <i class="fas fa-clipboard-list"></i>
        <span>Meeting Code Copied!</span>
    `
    document.querySelector('.clipboard').innerHTML = html;
}

/***********************************************UI Response Handlers End***********************************************/