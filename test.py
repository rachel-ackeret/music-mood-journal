from unittest import TestCase
from server import app


class FlaskTestsDatabase(TestCase):
    """Flask tests that use the database."""

    def setUp(self):
        """Stuff to do before every test."""

        # Get the Flask test client
        self.client = app.test_client()
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'SECRETSECRETSECRET'

    def tearDown(self):
        """Do at end of every test."""

    def test_departments_details(self):
        """Test home/login page."""

        result = self.client.get("/")
        self.assertEqual(result.status_code, 200)
        self.assertIn(b"Please Sign In", result.data)
