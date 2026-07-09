import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
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
  link,
  main,
  text,
} from './_styles'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={eyebrow}>{SITE_LABEL}</Text>
        </Section>
        <Section style={inner}>
          <Heading style={h1}>Confirm your email</Heading>
          <Text style={text}>
            Thanks for signing up at{' '}
            <Link href={siteUrl} style={link}>
              {siteName}
            </Link>
            . Confirm the address <strong>{recipient}</strong> to activate your
            account.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Verify email →
          </Button>
          <Text style={footer}>
            Didn't sign up? Ignore this email and nothing will happen.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
