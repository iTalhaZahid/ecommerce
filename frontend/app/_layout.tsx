import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Stack } from "expo-router";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import "../global.css";
export default function RootLayout() {
  const queryClient = new QueryClient()
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </ClerkProvider >
  )
}
