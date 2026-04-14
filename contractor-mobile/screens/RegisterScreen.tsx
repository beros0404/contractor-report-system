import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native'
import Icon from '@expo/vector-icons/Ionicons'
import { useAuth } from '../src/contexts/AuthContext'

export default function RegisterScreen({ navigation }: any) {
  const { signUp, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRegister = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo electrónico')
      return
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      await signUp(email, password, { role: 'contratista' })
      navigation.replace('MainTabs')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse')
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContent}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>

        <View style={s.logoContainer}>
          <Icon name="document-text" size={50} color={C.primary} />
          <Text style={s.title}>Crear cuenta</Text>
          <Text style={s.subtitle}>Regístrate para comenzar</Text>
        </View>

        <View style={s.form}>
          <View style={s.inputGroup}>
            <Text style={s.label}>Correo electrónico</Text>
            <View style={s.inputContainer}>
              <Icon name="mail-outline" size={20} color={C.muted} />
              <TextInput
                style={s.input}
                placeholder="tu@email.com"
                placeholderTextColor={C.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Contraseña</Text>
            <View style={s.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color={C.muted} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={C.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={C.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Confirmar contraseña</Text>
            <View style={s.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color={C.muted} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={C.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={C.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.registerBtn} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.registerBtnText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.loginText}>
              ¿Ya tienes cuenta? <Text style={s.loginHighlight}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const C = {
  primary: '#4f6ef7',
  text: '#111827',
  muted: '#6b7280',
  placeholder: '#9ca3af',
  border: '#e5e7eb',
  bg: '#f3f4f8',
  card: '#ffffff',
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backBtn: {
    padding: 8,
    marginTop: Platform.OS === 'ios' ? 8 : 16,
    alignSelf: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: C.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: C.card,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: C.text,
  },
  registerBtn: {
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: C.muted,
  },
  loginHighlight: {
    color: C.primary,
    fontWeight: '600',
  },
})