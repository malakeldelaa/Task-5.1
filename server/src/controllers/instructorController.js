
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
    const { name, department, role } = req.query || {};

    const allowedValues = { name, department, role };

    for (const value of Object.values(allowedValues)) {
      if (value !== undefined && typeof value !== 'string') {
        return res.status(400).json({
          message: 'Invalid search parameters'
        });
      }
    }

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

    // Reject empty searches instead of returning every instructor.
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
