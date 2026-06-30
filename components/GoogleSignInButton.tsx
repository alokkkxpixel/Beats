import { useOAuth } from '@clerk/expo'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useRouter } from 'expo-router'
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// Required: complete any pending auth sessions on app load
WebBrowser.maybeCompleteAuthSession()

interface GoogleSignInButtonProps {
    onSignInComplete?: () => void
    showDivider?: boolean
}

export function GoogleSignInButton({
    onSignInComplete,
    showDivider = true,
}: GoogleSignInButtonProps) {
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
    const router = useRouter()

    // Only render on iOS and Android
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return null
    }

    const handleGoogleSignIn = async () => {
        try {
            console.log('[Google Auth] Starting OAuth flow...')
            const { createdSessionId, setActive } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/', { scheme: 'beats' }),
            })
            console.log('[Google Auth] Flow result — createdSessionId:', createdSessionId)

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })
                console.log('[Google Auth] Session activated, navigating...')

                if (onSignInComplete) {
                    onSignInComplete()
                } else {
                    router.replace('/(drawer)/(tabs)')
                }
            } else {
                console.warn('[Google Auth] No createdSessionId returned')
            }
        } catch (err: any) {
            if (err.code === 'SIGN_IN_CANCELLED' || err.code === '-5') {
                console.log('[Google Auth] Cancelled by user')
                return
            }

            console.error('[Google Auth] Error:', JSON.stringify(err, null, 2))
            Alert.alert('Error', err.message || 'An error occurred during Google sign-in')
        }
    }

    return (
        <>
            {showDivider && (
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>
            )}

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
        </>
    )
}

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: '#4285F4',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#666',
    },
})