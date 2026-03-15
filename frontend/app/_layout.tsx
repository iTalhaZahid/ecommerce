import { Stack } from "expo-router";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import "../global.css";
export default function RootLayout() {
  const queryClient = new QueryClient()

  return (

    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{headerShown:false}}/>
    </QueryClientProvider>
  )
}
