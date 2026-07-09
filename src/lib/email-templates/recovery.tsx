import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import {
  SITE_LABEL,
  button,
  container,
  eyebrow,
  footer,
  h1,
  header,
  inner,
  main,
  text,
} from './_styles'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={eyebrow}>{SITE_LABEL}</Text>
        </Section>
        <Section style={inner}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your password for {siteName}.
            Choose a new one below.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Reset password →
          </Button>
          <Text style={footer}>
            Didn't request a reset? Ignore this email. Your password stays the
            same.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
