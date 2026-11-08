import { ApiError, createPlan, fetchPlan, fetchPlans } from "@/api/client";
import type { NewPlan, Plan } from "@/types/plan";

const API = "http://api.test";

const plan: Plan = {
  id: "881b7731-f31a-4dac-8d30-5acdd209a81b",
  title: "Coffee at Saint Frank",
  description: null,
  location: "2340 Polk St",
  starts_at: "2030-01-01T23:00:00Z",
  max_participants: 3,
  created_at: "2029-12-31T10:00:00Z",
};

const newPlan: NewPlan = {
  title: plan.title,
  description: null,
  location: plan.location,
  starts_at: plan.starts_at,
  max_participants: 3,
};

function respond(status: number, body: unknown) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
}

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("expected the promise to reject");
}

describe("fetchPlans", () => {
  test("GETs /plans and returns the parsed list", async () => {
    fetchMock.mockReturnValue(respond(200, [plan]));

    await expect(fetchPlans(API)).resolves.toEqual([plan]);
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/plans");
  });

  test("fails with not_configured and sends nothing when there's no API URL", async () => {
    const error = await caught(fetchPlans(undefined));

    expect(error.kind).toBe("not_configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("turns an unreachable server into a network error", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    expect((await caught(fetchPlans(API))).kind).toBe("network");
  });

  test("gives up after 10 seconds without a response", async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );

    const pending = caught(fetchPlans(API));
    jest.advanceTimersByTime(10_000);

    expect((await pending).kind).toBe("network");
    jest.useRealTimers();
  });

  test("turns a 500 into a server error", async () => {
    fetchMock.mockReturnValue(respond(500, { detail: "Internal Server Error" }));

    expect((await caught(fetchPlans(API))).kind).toBe("server");
  });
});

describe("fetchPlan", () => {
  test("GETs /plans/{id}", async () => {
    fetchMock.mockReturnValue(respond(200, plan));

    await expect(fetchPlan(plan.id, API)).resolves.toEqual(plan);
    expect(fetchMock.mock.calls[0][0]).toBe(`http://api.test/plans/${plan.id}`);
  });

  test("turns a 404 into not_found", async () => {
    fetchMock.mockReturnValue(respond(404, { detail: "Plan not found" }));

    expect((await caught(fetchPlan("missing", API))).kind).toBe("not_found");
  });
});

describe("createPlan", () => {
  test("POSTs the plan as JSON and returns the created plan", async () => {
    fetchMock.mockReturnValue(respond(201, plan));

    await expect(createPlan(newPlan, API)).resolves.toEqual(plan);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/plans");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual(newPlan);
  });

  test("maps a 422 response to errors per field", async () => {
    fetchMock.mockReturnValue(
      respond(422, {
        detail: [
          { loc: ["body", "title"], msg: "String should have at least 1 character" },
          { loc: ["body", "starts_at"], msg: "Value error, must be in the future" },
        ],
      }),
    );

    const error = await caught(createPlan(newPlan, API));

    expect(error.kind).toBe("validation");
    expect(error.fieldErrors).toEqual({
      title: "String should have at least 1 character",
      starts_at: "must be in the future",
    });
  });
});
