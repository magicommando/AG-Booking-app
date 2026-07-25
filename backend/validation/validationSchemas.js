exports.firearmSchemas = {
  create: {
    make: { required: true, type: "string", minLength: 2 },
    model: { required: true, type: "string", minLength: 1 },
    serialNumber: { required: true, type: "string", minLength: 3 },
    type: { required: true, type: "string", enum: ["pistol", "rifle", "shotgun", "smg", "carbine"] },
    caliber: { required: true, type: "string" }
  },

  update: {
    make: { type: "string" },
    model: { type: "string" },
    serialNumber: { type: "string" },
    type: { type: "string", enum: ["pistol", "rifle", "shotgun", "smg", "carbine"] },
    caliber: { type: "string" }
  }
};

exports.appointmentSchemas = {
  create: {
    firearmId: { required: true, type: "string" },
    gunsmithId: { required: true, type: "string" },
    serviceType: { required: true, type: "string" },
    appointmentDate: { required: true, type: "string" },
    notes: { type: "string", maxLength: 500 }
  },

  updateStatus: {
    status: { required: true, type: "string", enum: ["pending", "approved", "in progress", "completed", "cancelled"] }
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
    productName: { required: true, type: "string" },
    quantity: { required: true, type: "number" },
    category: { required: true, type: "string" },
    description: { type: "string", maxLength: 300 }
  },

  update: {
    productName: { type: "string" },
    quantity: { type: "number" },
    category: { type: "string" },
    description: { type: "string", maxLength: 300 }
  }
};

exports.messageSchemas = {
  send: {
    senderId: { required: true, type: "string" },
    receiverId: { required: true, type: "string" },
    appointmentId: { required: true, type: "string" },
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
    firearmId: { required: true, type: "string" },
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
