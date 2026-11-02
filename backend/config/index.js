const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

module.exports = {
  PORT: process.env.PORT || 5002,
  JWT_SECRET,
  MIN_LAYOVER: 60,
  MAX_LAYOVER: 720
};
