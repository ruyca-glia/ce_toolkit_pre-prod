// siteCloning3.2.js
async function onInvoke(request, env) {
  let logs = [];
  const log = (msg) => {
    logs.push(msg);
  };
  try {
    const envelope = await request.json();
    const payload = typeof envelope.payload === "string" ? JSON.parse(envelope.payload) : envelope.payload;
    const { siteId, siteName, address, baseURL, bearer } = payload;
    const baseSiteId = siteId;
    const partition = "Main";
    const baseBearer = bearer;
    const sameAccount = true;
    const newBearer = "";
    const newSiteId = "";
    const baseSite = {
      bearer: baseBearer,
      id: baseSiteId,
      partitions: [],
      policies: [],
      exceptions: [],
      teams: [],
      queues: [],
      questions: [],
      surveys: [],
      platformRules: [],
      webRules: [],
      contacts: [],
      locales: [],
      piiMasks: [],
      logoUrl: null,
      pictureUrl: null
    };
    const newSite = {
      bearer: newBearer,
      id: newSiteId,
      policies: [],
      exceptions: [],
      queues: [],
      questions: [],
      platformRules: [],
      webRules: []
    };
    const policyMap = /* @__PURE__ */ new Map();
    const exceptionMap = /* @__PURE__ */ new Map();
    const teamMap = /* @__PURE__ */ new Map();
    const queueMap = /* @__PURE__ */ new Map();
    const questionMap = /* @__PURE__ */ new Map();
    const baseApi = {
      async get(endpoint, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${baseBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const contentType = response.headers.get("content-type") || "";
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      },
      async post(endpoint, body, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${baseBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          body: body instanceof ArrayBuffer || body instanceof Uint8Array || typeof body === "string" ? body : JSON.stringify(body),
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      },
      async put(endpoint, body, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${baseBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          body: body instanceof ArrayBuffer || body instanceof Uint8Array || typeof body === "string" ? body : JSON.stringify(body),
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      },
      async patch(endpoint, body, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${baseBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          body: body instanceof ArrayBuffer || body instanceof Uint8Array || typeof body === "string" ? body : JSON.stringify(body),
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      }
    };
    const activeNewBearer = sameAccount ? baseBearer : newBearer;
    const newApi = {
      async get(endpoint, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${activeNewBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      },
      async post(endpoint, body, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${activeNewBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          body: body instanceof ArrayBuffer || body instanceof Uint8Array || typeof body === "string" ? body : JSON.stringify(body),
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      },
      async put(endpoint, body, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${activeNewBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          body: body instanceof ArrayBuffer || body instanceof Uint8Array || typeof body === "string" ? body : JSON.stringify(body),
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      },
      async patch(endpoint, body, options = {}) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${activeNewBearer}`,
            "Accept": "application/vnd.salemove.v1+json",
            "Content-Type": "application/json",
            ...options.headers
          },
          body: body instanceof ArrayBuffer || body instanceof Uint8Array || typeof body === "string" ? body : JSON.stringify(body),
          ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
        let headersObj = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        return { data, status: response.status, ok: response.ok, headers: headersObj };
      }
    };
    async function cloneSite() {
      try {
        const body = {
          name: siteName,
          addresses: Array.isArray(address) ? address : [address],
          clone_from_id: baseSite.id
        };
        const response = await baseApi.post(`/sites`, body);
        newSite.id = response.data.id;
      } catch (error) {
        log("Error creating site:" + error.message);
        throw new Error();
      }
    }
    async function getPartition(environment) {
      try {
        const response = await newApi.get(`/partitions`);
        response.data.partitions ? newSite.partitions = response.data.partitions : log("No partitions found.");
        let partitionId = "";
        let defaultPartitionId = "";
        for (const partition2 of newSite.partitions) {
          if (partition2.is_default) {
            defaultPartitionId = partition2.id;
          }
          if (partition2.name == environment) {
            partitionId = partition2.id;
          }
        }
        if (defaultPartitionId != partitionId) {
          const body = {
            is_default: true
          };
          const res = await newApi.patch(`/partitions/${partitionId}`, body);
        }
        return partitionId;
      } catch (error) {
        log("Error getting partitions: " + error.message);
        throw new Error();
      }
    }
    async function getPartitions(environment) {
      try {
        const response = await newApi.get(`/partitions`);
        response.data.partitions ? newSite.partitions = response.data.partitions : log("No partitions found.");
        for (const partition2 of newSite.partitions) {
          if (partition2.name == environment) {
            return partition2.id;
          }
        }
      } catch (error) {
        log("Error getting partitions: " + error.message);
        throw new Error();
      }
    }
    async function cloneSchedulingPolicies() {
      try {
        const response = await baseApi.get(`/queues/scheduling_policies?site_ids[]=${baseSite.id}`);
        response.data.scheduling_policies ? baseSite.policies = response.data.scheduling_policies : log("No scheduling policies found.");
        for (let i = 0; i < baseSite.policies.length; i++) {
          const policy = baseSite.policies[i];
          const body = {
            name: policy.name,
            timezone: policy.timezone,
            business_hours: policy.business_hours,
            description: policy.description ? policy.description : ""
          };
          const response2 = await newApi.post(`/queues/scheduling_policies?site_id=${newSite.id}`, body);
          newSite.policies.push(response2.data);
          policyMap.set(policy.id, response2.data.id);
        }
      } catch (error) {
        log("Error cloning scheduling policies: " + error.message);
        throw new Error();
      }
    }
    async function cloneSchedulingExceptions() {
      try {
        const response = await baseApi.get(`/queues/scheduling_exception_policies?view=full&site_ids[]=${baseSite.id}`);
        response.data.scheduling_exception_policies ? baseSite.exceptions = response.data.scheduling_exception_policies : log("No scheduling exceptions found.");
        for (let i = 0; i < baseSite.exceptions.length; i++) {
          const exception = baseSite.exceptions[i];
          const body = {
            name: exception.name,
            exception_rules: exception.exception_rules,
            description: exception.description || ""
          };
          const response2 = await newApi.post(`/queues/scheduling_exception_policies?site_id=${newSite.id}`, body);
          newSite.exceptions.push(response2.data);
          policyMap.set(exception.id, response2.data.id);
        }
      } catch (error) {
        log("Error cloning scheduling exceptions: " + error.message);
        throw new Error();
      }
    }
    async function getTeams() {
      try {
        const response = await baseApi.get(`/teams?site_ids[]=${baseSite.id}`);
        response.data.teams ? baseSite.teams = response.data.teams : log("No teams found.");
        const res = await newApi.get(`/teams?site_ids[]=${newSite.id}`);
        res.data.teams ? newSite.teams = res.data.teams : log("No teams found.");
        const tempTeamMap = /* @__PURE__ */ new Map();
        for (const oldTeam of baseSite.teams) {
          tempTeamMap.set(oldTeam.name, oldTeam.id);
        }
        for (const newTeam of newSite.teams) {
          const oldId = tempTeamMap.get(newTeam.name);
          teamMap.set(oldId, newTeam.id);
        }
      } catch (error) {
        log("Error syncing team mappings: " + error.message);
        throw new Error();
      }
    }
    async function updateTeams(partitionId) {
      try {
        await getTeams();
        for (const team of newSite.teams) {
          const body = {
            partition_id: partitionId
          };
          if (team.name != "General") {
            const response = await newApi.patch(`/teams/${team.id}`, body);
          }
        }
      } catch (error) {
        log("Error updating teams partition:");
      }
    }
    async function cloneQueues(partitionId) {
      try {
        log("Starting queue cloning");
        const response = await baseApi.get(`/queues?site_ids[]=${baseSite.id}`);
        response.data.queues ? baseSite.queues = response.data.queues : log("No queues found.");
        const tempQueueMap = /* @__PURE__ */ new Map();
        for (const oldQueue of baseSite.queues) {
          tempQueueMap.set(oldQueue.name, oldQueue.id);
        }
        for (let i = 0; i < baseSite.queues.length; i++) {
          const queue = baseSite.queues[i];
          const body = {
            site_id: newSite.id,
            name: queue.name,
            description: queue.description,
            is_default: queue.is_default,
            capacity_policy: queue.capacity_policy,
            routing_policy: { media: queue.routing_policy.media },
            when_unstaffed: queue.when_unstaffed,
            operator_ranking_enabled: queue.operator_ranking_enabled,
            welcome_message: queue.welcome_message,
            operator_affinity: queue.operator_affinity,
            status: queue.self_status,
            partition_id: partitionId,
            scheduling_policy_id: queue.scheduling_policy_id ? policyMap.get(queue.scheduling_policy_id) : null,
            scheduling_exception_policy_id: queue.scheduling_exception_policy_id ? exceptionMap.get(queue.scheduling_exception_policy_id) : null
          };
          if (queue.routing_policy.team_ids) {
            let mappedTeams = [];
            for (const oldTeamId of queue.routing_policy.team_ids) {
              if (teamMap.has(oldTeamId)) {
                mappedTeams.push(teamMap.get(oldTeamId));
              }
            }
            body.routing_policy = {
              media: queue.routing_policy.media,
              team_ids: mappedTeams
            };
          }
          const response2 = await newApi.post(`/queues`, body);
          newSite.queues.push(response2.data);
          queueMap.set(tempQueueMap.get(response2.data.name), response2.data.id);
          log("Cloned " + queue.name + " queue.");
        }
        await updateQueueFallbacks();
      } catch (error) {
        log("Error cloning queues: " + error.message);
        throw new Error();
      }
    }
    async function updateQueueFallbacks() {
      try {
        for (const oldQueue of baseSite.queues) {
          if (oldQueue.fallback_queue_id) {
            const body = {
              fallback_queue_id: queueMap.get(oldQueue.fallback_queue_id)
            };
            const newQueueId = queueMap.get(oldQueue.id);
            await newApi.put(`/queues/${newQueueId}`, body);
          }
        }
      } catch (error) {
        log("Error updating queue fallbacks: " + error.message);
        throw new Error();
      }
    }
    async function cloneQuestions() {
      try {
        const response = await baseApi.get(`/sites/${baseSite.id}/survey_questions`);
        response.data ? baseSite.questions = response.data : log("No questions found.");
        for (const question of baseSite.questions) {
          let body = {
            name: question.name,
            text: question.text,
            type: question.type
          };
          if (question.type === "single_choice" && question.options) {
            body.options = question.options.map(({ id, ...rest }) => rest);
          }
          const response2 = await newApi.post(`/sites/${newSite.id}/survey_questions`, body);
          newSite.questions.push(response2.data);
          questionMap.set(question.id, response2.data.id);
        }
      } catch (error) {
        log("Error cloning survey questions: " + error.message);
        throw new Error();
      }
    }
    async function cloneSurveys() {
      try {
        const response = await baseApi.get(`/sites/${baseSite.id}/surveys`);
        response.data ? baseSite.surveys = response.data : log("No surveys found.");
        for (const survey of baseSite.surveys) {
          let body = {
            name: survey.name,
            description: survey.description || "",
            title: survey.title,
            type: survey.type,
            is_default: survey.is_default,
            is_enabled: survey.is_enabled
          };
          if (survey.questions) {
            let questions = [];
            for (const sq of survey.questions) {
              const newQuestionId = questionMap.get(sq.id);
              const newQuestion = newSite.questions.find((q) => q.id == newQuestionId);
              questions.push({
                id: newQuestionId,
                required: sq.required,
                position: sq.position
              });
            }
            body.questions = questions;
          }
          if (survey.queue_ids.length) {
            let queueIds = [];
            for (const oldQueueId of survey.queue_ids) {
              queueIds.push(queueMap.get(oldQueueId));
            }
            body.queue_ids = queueIds;
          }
          await newApi.post(`/sites/${newSite.id}/surveys`, body);
        }
      } catch (error) {
        log("Error cloning surveys: " + error.message);
        throw new Error();
      }
    }
    async function clonePlatformRules() {
      try {
        const response = await baseApi.get(`/sites/${baseSite.id}/platform_rules`);
        response.data.rules ? baseSite.platformRules = response.data.rules : log("No platform rules found.");
        for (const rule of baseSite.platformRules) {
          let body = {
            site_id: newSite.id,
            name: rule.name,
            enabled: rule.enabled,
            sources: rule.sources,
            actions: rule.actions,
            description: rule.description || ""
          };
          if (rule.conditions) {
            let newConditions = [];
            for (const condition of rule.conditions) {
              let newCondition = { ...condition };
              if (condition.type === "from_queues" && condition.queue_ids) {
                let newQueues = [];
                for (const oldQueueId of condition.queue_ids) {
                  if (queueMap.has(oldQueueId)) {
                    newQueues.push(queueMap.get(oldQueueId));
                  }
                }
                newCondition.queue_ids = newQueues;
              }
              newConditions.push(newCondition);
            }
            body.conditions = newConditions;
          }
          const res = await newApi.post(`/sites/${newSite.id}/platform_rules`, body);
          newSite.platformRules.push(res.data);
        }
      } catch (error) {
        log("Error cloning platform rules: " + error.message);
        throw new Error();
      }
    }
    async function updateWebRules() {
      try {
        const response = await baseApi.get(`/sites/${newSite.id}/business_rules`);
        response.data.rules ? newSite.webRules = response.data.rules : log("No web rules found (on new site).");
        for (const rule of newSite.webRules) {
          let body = {};
          let update = false;
          if (rule.actions) {
            for (const action of rule.actions) {
              if (action.type === "set_queues_for_visitor_v2") {
                update = true;
                let mediaRouting = action.media_routing;
                if (mediaRouting.audio.enabled && mediaRouting.audio.queue_id) {
                  mediaRouting.audio.queue_id = queueMap.get(mediaRouting.audio.queue_id);
                }
                if (mediaRouting.text.enabled && mediaRouting.text.queue_id) {
                  mediaRouting.text.queue_id = queueMap.get(mediaRouting.text.queue_id);
                }
                if (mediaRouting.messaging.enabled && mediaRouting.messaging.queue_id) {
                  mediaRouting.messaging.queue_id = queueMap.get(mediaRouting.messaging.queue_id);
                }
                if (mediaRouting.phone.enabled && mediaRouting.phone.queue_id) {
                  mediaRouting.phone.queue_id = queueMap.get(mediaRouting.phone.queue_id);
                }
                if (mediaRouting.video.enabled && mediaRouting.video.queue_id) {
                  mediaRouting.video.queue_id = queueMap.get(mediaRouting.video.queue_id);
                }
              }
              body.actions = rule.actions;
            }
          }
          if (rule.post_conditions) {
            for (let j = 0; j < rule.post_conditions.length; j++) {
              let condition = rule.post_conditions[j];
              if (condition.type === "queues_availability") {
                update = true;
                body.post_conditions = rule.post_conditions;
                for (let x = 0; x < condition.queue_ids.length; x++) {
                  body.post_conditions[j].queue_ids[x] = queueMap.get(condition.queue_ids[x]);
                }
              }
            }
          }
          if (update) {
            await newApi.patch(`/sites/${newSite.id}/business_rules/${rule.id}`, body);
          }
        }
        if (newSite.webRules.length != 0) {
          newSite.webRules = [];
          const res = await baseApi.get(`/sites/${newSite.id}/business_rules`);
          res.data.rules ? newSite.webRules = response.data.rules : log("No web rules found to update (on new site).");
        }
      } catch (error) {
        log("Error processing business web rules: " + error.message);
        throw new Error();
      }
    }
    async function cloneContacts() {
      try {
        let url = `/contacts?site_ids[]=${baseSite.id}`;
        while (url) {
          const response = await baseApi.get(url);
          response.data.contacts ? baseSite.contacts = response.data.contacts : log("No contacts found.");
          for (const contact of baseSite.contacts) {
            let body = {
              site_id: newSite.id,
              name: contact.name,
              phone_number: contact.phone_number
            };
            if (contact.email) {
              body.email = contact.email;
            }
            if (contact.description) {
              body.description = contact.description;
            }
            if (contact.phone_extension) {
              body.phone_extension = contact.phone_extension;
            }
            await newApi.post(`/contacts`, body);
          }
          url = response.data.next_page ? response.data.next_page : null;
        }
      } catch (error) {
        log("Error cloning quick contacts: " + error.message);
        throw new Error();
        log(error);
      }
    }
    async function cloneCustomLocales() {
      try {
        const response = await baseApi.get(`/visitor_app/sites/${baseSite.id}/custom_locales`);
        response.data.custom_locales ? baseSite.locales = response.data.custom_locales : log("No custom locales found.");
        for (const locale of baseSite.locales) {
          const body = {
            name: locale.name,
            description: locale.description,
            locale_key: locale.locale_key,
            base_locale_key: locale.base_locale_key,
            translations: locale.translations
          };
          await newApi.post(`/visitor_app/sites/${newSite.id}/custom_locales`, body);
        }
      } catch (error) {
        log("Error cloning custom locales: " + error.message);
        throw new Error();
      }
    }
    async function clonePiiMasking() {
      try {
        const response = await baseApi.get(`/masking_regular_expressions?site_id=${baseSite.id}`);
        baseSite.piiMasks = response.data.masking_regular_expressions || [];
        response.data.masking_regular_expressions ? baseSite.piiMasks = response.data.masking_regular_expressions : log("No custom PII masking found.");
        for (const mask of baseSite.piiMasks) {
          let body = {
            site_id: newSite.id,
            regular_expression: mask.regular_expression,
            enabled: mask.enabled,
            name: mask.name || ""
          };
          await newApi.post(`/masking_regular_expressions`, body);
        }
      } catch (error) {
        log("Error cloning PII masking configurations: " + error.message);
        throw new Error();
      }
    }
    async function cloneSiteImageAssets() {
      try {
        const response = await baseApi.get(`/sites/${baseSite.id}`);
        baseSite.logoUrl = response.data.logo ? response.data.logo.url : null;
        baseSite.pictureUrl = response.data.default_operator_picture ? response.data.default_operator_picture.url : null;
        let body = {};
        if (baseSite.logoUrl) {
          const logoRes = await fetch(baseSite.logoUrl);
          if (!logoRes.ok) throw new Error(`HTTP error fetching logo: ${logoRes.status}`);
          const logoBuffer = await logoRes.arrayBuffer();
          const logoBase64 = `data:${logoRes.headers.get("content-type")};base64,${Buffer.from(logoBuffer).toString("base64")}`;
          body.logo = logoBase64;
        }
        if (baseSite.pictureUrl) {
          const picRes = await fetch(baseSite.pictureUrl);
          if (!picRes.ok) throw new Error(`HTTP error fetching picture: ${picRes.status}`);
          const picBuffer = await picRes.arrayBuffer();
          const picBase64 = `data:${picRes.headers.get("content-type")};base64,${Buffer.from(picBuffer).toString("base64")}`;
          body.default_operator_picture = picBase64;
        }
        if (Object.keys(body).length > 0) {
          await newApi.put(`/sites/${newSite.id}`, body);
        }
      } catch (error) {
        log("Error cloning site branding assets:");
      }
    }
    async function cloneSiteCollection() {
      try {
        log("Starting site cloning");
        if (sameAccount) {
          const partitionId = await getPartition(partition);
          await cloneSite();
          await cloneSchedulingPolicies();
          log("Cloning scheduling policies complete\n");
          await cloneSchedulingExceptions();
          log("Cloning scheduling exceptions complete\n");
          await updateTeams(partitionId);
          log("Updating teams complete\n");
          await cloneQueues(partitionId);
          log("Cloning queues complete\n");
          await cloneQuestions();
          log("Cloning questions complete\n");
          await cloneSurveys();
          log("Cloning survey complete\n");
          await clonePlatformRules();
          log("Cloning platform rules complete\n");
          await updateWebRules();
          log("Updating web rules complete\n");
          await cloneCustomLocales();
          log("Cloning custom locales complete\n");
          await clonePiiMasking();
          log("Cloning PII masking complete\n");
          log("Site cloning within same account complete.");
        } else {
        }
      } catch (error) {
        log("Error cloning site: " + error.message);
        throw new Error();
      }
    }
    await cloneSiteCollection();
    return Response.json({
      success: true,
      message: "Site cloning completed successfully.",
      logs
    });
  } catch (error) {
    console.error("Orchestrator Error:", error);
    return Response.json({
      success: false,
      error: error.message,
      logs
    }, { status: 500 });
  }
}
export {
  onInvoke
};
