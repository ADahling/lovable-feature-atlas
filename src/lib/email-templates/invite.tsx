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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={eyebrow}>{SITE_LABEL}</Text>
        </Section>
        <Section style={inner}>
          <Heading style={h1}>You're invited</Heading>
          <Text style={text}>
            You've been invited to join{' '}
            <Link href={siteUrl} style={link}>
              {siteName}
            </Link>
            . Accept below to create your account.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Accept invitation →
          </Button>
          <Text style={footer}>
            Not expecting this? You can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
