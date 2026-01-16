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

export default function ResetPasswordEmail({ url }: { url: string }) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Reset your password</Preview>
        <Section className="bg-gray-100 p-6">
          <Container className="bg-white rounded-lg shadow-md p-6">
            <Heading className="text-2xl font-bold mb-4">Reset Your Password</Heading>
            <Text className="mb-4">
              You have requested to reset your password. Please click the button below to proceed:
            </Text>
            <Button
              className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 px-4 py-2 cursor-pointer"
              href={url}
            >
              Reset Password
            </Button>
            <Text className="mt-4 text-sm text-gray-600">
              If you did not request a password reset, no further action is required.
            </Text>
          </Container>
        </Section>
      </Html>
    </Tailwind>
  );
}
