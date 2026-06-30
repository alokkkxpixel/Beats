import { useOAuth } from '@clerk/expo'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useRouter } from 'expo-router'
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// Required: complete any pending auth sessions on app load
WebBrowser.maybeCompleteAuthSession()

interface GitHubSignInButtonProps {
    onSignInComplete?: () => void
    showDivider?: boolean
}

export function GitHubSignInButton({
    onSignInComplete,
    showDivider = false,
}: GitHubSignInButtonProps) {
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_github' })
    const router = useRouter()

    // Only render on iOS and Android
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return null
    }

    const handleGitHubSignIn = async () => {
        try {
            console.log('[GitHub Auth] Starting OAuth flow...')
            const { createdSessionId, setActive } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/', { scheme: 'beats' }),
            })
            console.log('[GitHub Auth] Flow result — createdSessionId:', createdSessionId)

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })
                console.log('[GitHub Auth] Session activated, navigating...')

                if (onSignInComplete) {
                    onSignInComplete()
                } else {
                    router.replace('/(drawer)/(tabs)')
                }
            } else {
                console.warn('[GitHub Auth] No createdSessionId returned')
            }
        } catch (err: any) {
            if (err.code === 'SIGN_IN_CANCELLED' || err.code === '-5') {
                console.log('[GitHub Auth] Cancelled by user')
                return
            }

            console.error('[GitHub Auth] Error:', JSON.stringify(err, null, 2))
            Alert.alert('Error', err.message || 'An error occurred during GitHub sign-in')
        }
    }

    return (
        <>
            <TouchableOpacity style={styles.githubButton} onPress={handleGitHubSignIn}>
                <Text style={styles.githubButtonText}>Sign in with GitHub</Text>
            </TouchableOpacity>

            {showDivider && (
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    githubButton: {
        backgroundColor: '#24292e',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#444',
    },
    githubButtonText: {
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
