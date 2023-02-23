import './App.css';
import React,{useRef,useState} from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({

    //use your config
  
})

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h2>😎🧠🧟</h2>
        <h1>Allchat</h1>
        <SignOut/>
      </header>
        <section>
          {user?<ChatRoom/>:<SignIn />}
       </section>
      
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign In</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummy =useRef()
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
  
    setFormValue('');

    dummy.current.scrollIntoView({ behaviour: 'smooth' });
  }


  return (

    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="type your text here" />
        

        <button type='submit'>Post</button>

      </form>

    </>
  )

}

function ChatMessage(props) {
  const { text, uid ,photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
    <div className={`message ${ messageClass}`}>
      <img src={photoURL} alt="chat pic" onError={({ currentTarget }) => {
    currentTarget.onerror = null; // prevents looping
    currentTarget.src="logo192.png";
    }}/>
      {/* <h4>{ createdAt}</h4> */}
      <p>{ text }</p>
    </div>
</>
  )
}





export default App;
