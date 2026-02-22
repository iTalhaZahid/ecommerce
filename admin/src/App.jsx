import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

function App() {
  return (
    
    <div>
      <h1>Hello</h1>
      <SignedOut>
        <SignInButton mode='modal' />
        <SignUpButton mode='modal' />
      </SignedOut>
      {/* Show the user button when the user is signed in */}
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
}

export default App