exports.firearmSchemas = {
  create: {
    make: { required: true, type: "string", minLength: 2 },
    model: { required: true, type: "string", minLength: 1 },
    serial: { type: "string", minLength: 1 },
    serialNumber: { type: "string", minLength: 1 },
    type: { type: "string" },
    caliber: { type: "string" }
  },

  update: {
    make: { type: "string" },
    model: { type: "string" },
    serial: { type: "string" },
    serialNumber: { type: "string" },
    type: { type: "string" },
    caliber: { type: "string" }
  }
};

exports.authSchemas = {
  register: {
    firstName: { required: true, type: "string", minLength: 1 },
    lastName: { required: true, type: "string", minLength: 1 },
    email: { required: true, type: "string", minLength: 3 },
    password: { required: true, type: "string", minLength: 6 },
    phone: { required: true, type: "string", minLength: 7 },
    location: { required: true, type: "string", minLength: 2 },
    billingAddress: { required: true, type: "string", minLength: 5 },
    preferredContactMethod: { required: true, type: "string", enum: ["email", "phone", "sms"] },
    role: { type: "string", enum: ["client", "gunsmith"] }
  }
};

exports.userSchemas = {
  profileUpdate: {
    fullName: { type: "string", minLength: 1 },
    email: { required: true, type: "string", minLength: 3 },
    phone: { required: true, type: "string", minLength: 7 },
    location: { required: true, type: "string", minLength: 2 },
    billingAddress: { required: true, type: "string", minLength: 5 },
    preferredContactMethod: { required: true, type: "string", enum: ["email", "phone", "sms"] }
  }
};

exports.appointmentSchemas = {
  create: {
    firearmId: { required: true, type: "string" },
    service: { type: "string" },
    serviceType: { type: "string" },
    serviceId: { type: "string" },
    date: { type: "string" },
    time: { type: "string" },
    appointmentDate: { type: "string" },
    gunsmithId: { type: "string" },
    notes: { type: "string", maxLength: 500 }
  },

  updateStatus: {
    status: { required: true, type: "string", enum: ["pending", "approved", "in progress", "completed", "cancelled"] }
  },

  updateAdmin: {
    status: { type: "string", enum: ["pending", "approved", "denied", "in progress", "completed", "cancelled"] },
    date: { type: "string" },
    time: { type: "string" },
    appointmentDate: { type: "string" },
    notes: { type: "string", maxLength: 500 }
  }
};

exports.workOrderSchemas = {
  create: {
    appointmentId: { required: true, type: "string" },
    partsNeeded: { type: "object" },
    estimatedTime: { type: "number" },
    notes: { type: "string", maxLength: 500 }
  },

  update: {
    partsNeeded: { type: "object" },
    progress: { type: "string", enum: ["not started", "in progress", "completed"] },
    notes: { type: "string", maxLength: 500 },
    invoice: { type: "object" }
  }
};

exports.inventorySchemas = {
  create: {
    productName: { type: "string" },
    name: { type: "string" },
    quantity: { type: "number" },
    category: { type: "string" },
    location: { type: "string" },
    notes: { type: "string", maxLength: 500 },
    sku: { type: "string" },
    partNumber: { type: "string" },
    cost: { type: "number" },
    price: { type: "number" },
    supplier: { type: "string" },
    vendor: { type: "string" }
  },

  update: {
    productName: { type: "string" },
    name: { type: "string" },
    quantity: { type: "number" },
    category: { type: "string" },
    location: { type: "string" },
    notes: { type: "string", maxLength: 500 },
    sku: { type: "string" },
    partNumber: { type: "string" },
    cost: { type: "number" },
    price: { type: "number" },
    supplier: { type: "string" },
    vendor: { type: "string" }
  }
};

exports.messageSchemas = {
  send: {
    senderId: { required: true, type: "string" },
    receiverId: { required: true, type: "string" },
    appointmentId: { type: "string" },
    text: { type: "string", maxLength: 2000 },
    attachments: { type: "object" }
  }
};

exports.serviceSchemas = {
  create: {
    name: { required: true, type: "string" },
    price: { required: true, type: "number" },
    description: { type: "string", maxLength: 300 }
  }
};

exports.aiSchemas = {
  analyzeFirearm: {
    firearmId: { type: "string" },
    inputText: { required: true, type: "string", minLength: 5 },
    photoUrl: { type: "string" }
  },

  inventoryScan: {
    items: { required: true, type: "object" }
  },

  saveAnalysis: {
    firearmId: { type: "string" },
    inputText: { required: true, type: "string" },
    photoUrl: { type: "string" },
    aiResponse: { required: true, type: "string" }
  }
};
