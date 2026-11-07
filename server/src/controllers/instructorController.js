
import { Instructor } from '../models/Instructor.js';

// Return only fields that are safe to expose publicly.
function publicProfile(instructor) {
  return {
    id: instructor._id,
    name: instructor.name,
    username: instructor.username,
    department: instructor.department,
    role: instructor.role
  };
}

// =============================================================================
// LOGIN
// =============================================================================
export async function loginInstructor(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        message: 'Valid username and password are required'
      });
    }

    const instructor = await Instructor.findOne({
      username: username.trim()
    }).select('+password');

    if (!instructor || !(await instructor.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    return res.status(200).json({
      instructor: publicProfile(instructor)
    });
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// PUBLIC INSTRUCTOR DIRECTORY
// =============================================================================
export async function getDirectory(req, res, next) {
  try {
    const instructors = await Instructor.find()
      .select('name department role')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({ instructors });
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// INSTRUCTOR SEARCH
// =============================================================================
export async function searchInstructors(req, res, next) {
  try {
    const query = req.query || {};

    // Only these parameters are allowed.
    const allowedKeys = ['name', 'department', 'role'];

    // Detect unknown or sanitized malicious parameters.
    const hasUnexpectedKeys = Object.keys(query).some(
      (key) => !allowedKeys.includes(key)
    );

    // Detect objects instead of ordinary string values.
    const hasInvalidValues = allowedKeys.some(
      (key) => query[key] !== undefined &&
               typeof query[key] !== 'string'
    );

    // Malicious or malformed searches return no results.
    if (hasUnexpectedKeys || hasInvalidValues) {
      return res.status(200).json({
        count: 0,
        instructors: []
      });
    }

    const { name, department, role } = query;

    const filter = {};

    if (name && name.trim()) {
      filter.name = name.trim();
    }

    if (department && department.trim()) {
      filter.department = department.trim();
    }

    if (role && role.trim()) {
      filter.role = role.trim();
    }

    // Preserve empty-search protection.
    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        message: 'At least one valid search parameter is required'
      });
    }

    const instructors = await Instructor.find(filter)
      .select('name department role')
      .lean();

    return res.status(200).json({
      count: instructors.length,
      instructors
    });

  } catch (error) {
    next(error);
  }
}
