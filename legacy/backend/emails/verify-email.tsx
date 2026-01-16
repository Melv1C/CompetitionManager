import {
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

export default function VerifyEmail({ url }: { url: string }) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Verify your email address</Preview>
        <Section className="bg-gray-100 p-6">
          <Container className="bg-white rounded-lg shadow-md p-6">
            <Heading className="text-2xl font-bold mb-4">Verify Your Email Address</Heading>
            <Text className="mb-4">
              Thank you for signing up! Please verify your email address by clicking the button
              below:
            </Text>
            <Button
              className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 px-4 py-2 cursor-pointer"
              href={url}
            >
              Verify Email
            </Button>
            <Text className="mt-4 text-sm text-gray-600">
              If you did not create an account, no further action is required.
            </Text>
          </Container>
        </Section>
      </Html>
    </Tailwind>
  );
}
