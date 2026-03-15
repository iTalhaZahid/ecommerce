import { View, Text, TouchableOpacity } from 'react-native'
import { useAuth } from '@clerk/expo'

const MainScreen = () => {
    const { signOut } = useAuth()
    return (
        <View className='flex-1 justify-center items-center'>
            <Text className='text-xl'>MainScreen</Text>
            {/* Logout Button */}
            <TouchableOpacity className='bg-red-500 text-white py-2 px-4 rounded-full mt-4' onPress={() => signOut()}>
              <Text className='text-white font-medium'>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}

export default MainScreen