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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={eyebrow}>{SITE_LABEL}</Text>
        </Section>
        <Section style={inner}>
          <Heading style={h1}>Your login link</Heading>
          <Text style={text}>
            Click below to sign in to {siteName}. The link expires shortly.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Log in →
          </Button>
          <Text style={footer}>
            Didn't request this? Ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
