import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";

function useSocialAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const { startSSOFlow } = useSSO();

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
        setIsLoading(true);
        try {
            const { createdSessionId, setActive } = await startSSOFlow({ strategy });
            if (createdSessionId && setActive) {
                //Handle successful authentication
                await setActive({ session: createdSessionId });
            }
        } catch (error) {
            console.error("Social authentication error:", error);
            const providerName = strategy === "oauth_google" ? "Google" : "Apple";
            Alert.alert("Authentication Error", `An error occurred during ${providerName} authentication. Please try again.`);
        }
        finally {
            setIsLoading(false);
        }
    }

    return { isLoading, handleSocialAuth };
}

export default useSocialAuth;